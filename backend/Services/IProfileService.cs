using TeamExamProject.Contracts.Auth;
using TeamExamProject.Contracts.Profile;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис профиля пользователя: чтение, маппинг и обновление персональных данных.
/// </summary>
public interface IProfileService
{
    /// <summary>Возвращает профиль пользователя по идентификатору или <c>null</c>, если не найден.</summary>
    Task<UserProfileResponse?> GetProfileAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Преобразует сущность пользователя в DTO профиля с дополнительными вычисляемыми полями.</summary>
    Task<UserProfileResponse> MapToProfileResponseAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>Обновляет профиль пользователя согласно переданным данным.</summary>
    Task<ProfileUpdateResult> UpdateProfileAsync(int userId, UpdateProfileDto request, CancellationToken cancellationToken = default);
}
