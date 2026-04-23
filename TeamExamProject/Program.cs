using System.Text;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using TeamExamProject.Data;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Models;
using TeamExamProject.Options;
using TeamExamProject.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
        npgsqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(5), null)));
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IGroupsService, GroupsService>();
builder.Services.AddScoped<IKnowledgePostsService, KnowledgePostsService>();
builder.Services.AddScoped<IHelpRequestsService, HelpRequestsService>();
builder.Services.AddScoped<IVotesService, VotesService>();
builder.Services.AddScoped<ICheckInsService, CheckInsService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddProblemDetails();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TeamExamProject API",
        Version = "v1"
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = JwtBearerDefaults.AuthenticationScheme
        }
    };

    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            securityScheme,
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
    }
});

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
                 ?? throw new InvalidOperationException("JWT configuration is missing.");

if (string.IsNullOrWhiteSpace(jwtOptions.Key) || jwtOptions.Key.Length < 32)
{
    throw new InvalidOperationException("JWT key must be configured and contain at least 32 characters.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(PolicyNames.Student, policy =>
        policy.RequireRole(Roles.Student, Roles.Captain, Roles.Admin));
    options.AddPolicy(PolicyNames.Captain, policy =>
        policy.RequireRole(Roles.Captain, Roles.Admin));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider
        .GetRequiredService<ILoggerFactory>()
        .CreateLogger("DatabaseStartup");
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

    await InitializeDatabaseAsync(app, dbContext, passwordHasher, logger, connectionString);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", async (AppDbContext dbContext) =>
{
    var canConnect = await dbContext.Database.CanConnectAsync();
    return canConnect
        ? Results.Ok(new { status = "ok", database = "up" })
        : Results.Problem(title: "Database is unavailable", statusCode: StatusCodes.Status503ServiceUnavailable);
});

app.Run();

static async Task InitializeDatabaseAsync(
    WebApplication app,
    AppDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    ILogger logger,
    string connectionString)
{
    const int maxAttempts = 10;
    var delay = TimeSpan.FromSeconds(3);

    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            await dbContext.Database.MigrateAsync();
            await SeedData.InitializeAsync(dbContext, passwordHasher);
            logger.LogInformation("Database migration and seed completed successfully.");
            return;
        }
        catch (Exception exception) when (IsDatabaseConnectionError(exception))
        {
            logger.LogWarning(
                exception,
                "Database connection attempt {Attempt}/{MaxAttempts} failed for {ConnectionTarget}.",
                attempt,
                maxAttempts,
                DescribeConnectionTarget(connectionString));

            if (attempt == maxAttempts)
            {
                var message =
                    $"Could not connect to PostgreSQL at {DescribeConnectionTarget(connectionString)} after {maxAttempts} attempts. " +
                    "Start PostgreSQL first, or override ConnectionStrings__DefaultConnection with a reachable host.";

                if (app.Environment.IsDevelopment())
                {
                    logger.LogError("{Message} The API will continue to start in degraded mode.", message);
                    return;
                }

                throw new InvalidOperationException(message, exception);
            }

            await Task.Delay(delay);
        }
    }
}

static bool IsDatabaseConnectionError(Exception exception)
{
    if (exception is TimeoutException || exception.InnerException is TimeoutException)
    {
        return true;
    }

    if (exception is PostgresException postgresException)
    {
        return postgresException.SqlState.StartsWith("08", StringComparison.Ordinal);
    }

    if (exception.InnerException is PostgresException innerPostgresException)
    {
        return innerPostgresException.SqlState.StartsWith("08", StringComparison.Ordinal);
    }

    return exception is NpgsqlException
           || exception.InnerException is NpgsqlException;
}

static string DescribeConnectionTarget(string connectionString)
{
    var builder = new NpgsqlConnectionStringBuilder(connectionString);
    var host = string.IsNullOrWhiteSpace(builder.Host) ? "unknown-host" : builder.Host;
    var port = builder.Port == 0 ? 5432 : builder.Port;
    var database = string.IsNullOrWhiteSpace(builder.Database) ? "unknown-db" : builder.Database;

    return $"{host}:{port}/{database}";
}
