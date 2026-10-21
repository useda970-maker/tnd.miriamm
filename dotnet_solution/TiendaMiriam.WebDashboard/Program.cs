using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Core.Services;
using TiendaMiriam.Infrastructure.Data;
using TiendaMiriam.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (SQLite)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                      ?? "Data Source=tiendamiram.db;";

builder.Services.AddDbContext<TiendaMiriamDbContext>(options =>
    options.UseSqlite(connectionString));

// 2. Authentication & Authorization (Cookie-based with strict roles)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.AccessDeniedPath = "/Account/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(12);
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("ADMIN"));
    options.AddPolicy("RequireCashierRole", policy => policy.RequireRole("CAJERO", "ADMIN"));
});

// 3. Dependency Injection
builder.Services.AddScoped<IUnitConversionService, UnitConversionService>();
builder.Services.AddScoped<IRecipeEngine, RecipeEngine>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// 4. MVC & API Controllers
builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// 5. Database Initialization (Auto Migration & Seed Data)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<TiendaMiriamDbContext>();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error al inicializar la base de datos SQLite.");
    }
}

// 6. HTTP Pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Dashboard}/{action=Index}/{id?}");

app.Run();
