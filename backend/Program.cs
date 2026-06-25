using System.Text;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TeamExamProject.Data;
using TeamExamProject.Infrastructure;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Models;
using TeamExamProject.Options;
using TeamExamProject.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // За reverse proxy (nginx, Traefik) — доверять заголовкам от прокси
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<KrkOptions>(builder.Configuration.GetSection(KrkOptions.SectionName));
builder.Services.Configure<LeagueOptions>(builder.Configuration.GetSection(LeagueOptions.SectionName));
builder.Services.Configure<TeamOptions>(builder.Configuration.GetSection(TeamOptions.SectionName));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
        npgsqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(5), null)));
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IGroupsService, GroupsService>();
builder.Services.AddScoped<IKnowledgePostsService, KnowledgePostsService>();
builder.Services.AddScoped<IHelpRequestsService, HelpRequestsService>();
builder.Services.AddScoped<IVotesService, VotesService>();
builder.Services.AddScoped<ICheckInsService, CheckInsService>();
builder.Services.AddScoped<IKrkCalculationService, KrkCalculationService>();
builder.Services.AddScoped<ITeamScoreService, TeamScoreService>();
builder.Services.AddScoped<IRatingsService, RatingsService>();
builder.Services.AddScoped<IChallengesService, ChallengesService>();
builder.Services.AddScoped<IEventsService, EventsService>();
builder.Services.AddScoped<INewsService, NewsService>();
builder.Services.AddScoped<IAssignmentsService, AssignmentsService>();
builder.Services.AddScoped<IActivityFeedService, ActivityFeedService>();
builder.Services.AddScoped<IAchievementsService, AchievementsService>();
// MVP-заглушки: реальная имплементация — после интеграции с УрФУ.
builder.Services.AddScoped<IExternalAuthProvider, NotImplementedExternalAuthProvider>();
builder.Services.AddScoped<IPortalGradesImporter, NotImplementedPortalGradesImporter>();
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
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

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

builder.Services.AddSingleton<DatabaseReadiness>();
builder.Services.AddSingleton<DatabaseInitializationService>();
builder.Services.AddHostedService<DatabaseInitializationHostedService>();

var app = builder.Build();

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
// Chrome PNA: preflight с Access-Control-Request-Private-Network иначе fetch с preview (4174) на API (8080) даёт «Failed to fetch».
app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        if (context.Request.Headers.ContainsKey("Access-Control-Request-Private-Network"))
        {
            context.Response.Headers["Access-Control-Allow-Private-Network"] = "true";
        }

        return Task.CompletedTask;
    });
    await next();
});
app.UseCors("Frontend");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseMiddleware<DatabaseReadinessMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", async (AppDbContext dbContext, DatabaseReadiness readiness) =>
{
    if (!readiness.IsReady)
    {
        return Results.Json(
            new
            {
                status = readiness.HasFailed ? "failed" : "starting",
                database = "initializing",
                message = readiness.FailureMessage
                          ?? "База данных инициализируется. Повторите запрос через несколько секунд."
            },
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    var canConnect = await dbContext.Database.CanConnectAsync();
    if (!canConnect)
    {
        return Results.Problem(title: "Database is unavailable", statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    var pending = (await dbContext.Database.GetPendingMigrationsAsync()).ToArray();
    if (pending.Length > 0)
    {
        return Results.Json(
            new
            {
                status = "degraded",
                database = "up",
                message =
                    "Есть невыполненные миграции EF. Остановите API и выполните: dotnet ef database update --project backend",
                pendingMigrations = pending
            },
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    return Results.Ok(new { status = "ok", database = "up" });
});

app.MapFallbackToFile("index.html");

app.Run();
