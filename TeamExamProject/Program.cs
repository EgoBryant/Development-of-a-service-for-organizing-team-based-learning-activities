using TeamExamProject.Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetRequiredConnectionString();

builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

await app.InitializeDatabaseAsync(connectionString);
app.UseApplicationPipeline();
app.MapApplicationEndpoints();

app.Run();
