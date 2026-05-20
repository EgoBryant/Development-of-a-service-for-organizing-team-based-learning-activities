using TeamExamProject.Contracts.Auth;

namespace TeamExamProject.Services;

public enum AuthResultType
{
    Succeeded,
    EmailAlreadyTaken,
    InvalidCredentials,
    DuplicateEmail
}

public sealed class AuthResult
{
    public required AuthResultType Type { get; init; }
    public AuthResponse? Response { get; init; }
}
