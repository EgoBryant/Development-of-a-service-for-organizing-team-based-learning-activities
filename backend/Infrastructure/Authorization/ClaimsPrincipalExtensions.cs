using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TeamExamProject.Infrastructure.Authorization;

public static class ClaimsPrincipalExtensions
{
    public static int? GetUserId(this ClaimsPrincipal user)
    {
        var value =
            user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? user.FindFirstValue("sub");

        return int.TryParse(value, out var userId) && userId > 0 ? userId : null;
    }
}
