using TeamExamProject.Models;

namespace TeamExamProject.Services;

public interface IJwtTokenService
{
    string CreateToken(User user);
}
