using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Auth;
using TeamExamProject.Contracts.Profile;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Методы просмотра и редактирования личного кабинета пользователя.
/// </summary>
[Route("api/profile")]
[Authorize]
public class ProfileController : ApiControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    /// <summary>
    /// Возвращает профиль текущего пользователя.
    /// </summary>
    /// <returns>Данные профиля, команды и учебной группы.</returns>
    [HttpGet]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> Get(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var profile = await _profileService.GetProfileAsync(userId.Value, cancellationToken);
        if (profile is null)
        {
            return NotFound(Problem(
                title: "Profile not found",
                detail: "The current user profile does not exist.",
                statusCode: StatusCodes.Status404NotFound));
        }

        return Ok(profile);
    }

    /// <summary>
    /// Обновляет данные профиля текущего пользователя.
    /// </summary>
    /// <param name="request">Новые значения профиля: ФИО, контакты, описание, группа и другие поля.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Обновленный профиль пользователя.</returns>
    [HttpPut]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> Put(
        [FromBody] UpdateProfileDto request,
        CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _profileService.UpdateProfileAsync(userId.Value, request, cancellationToken);
        return result.Type switch
        {
            ProfileUpdateResultType.UserNotFound => NotFound(Problem(
                title: "Profile not found",
                detail: "The current user profile does not exist.",
                statusCode: StatusCodes.Status404NotFound)),
            ProfileUpdateResultType.GroupNotFound => BadRequest(Problem(
                title: "Group not found",
                detail: "The selected group does not exist.",
                statusCode: StatusCodes.Status400BadRequest)),
            ProfileUpdateResultType.StudentTicketAlreadyUsed => BadRequest(Problem(
                title: "Student ticket conflict",
                detail: "This student ticket number is already assigned to another user.",
                statusCode: StatusCodes.Status400BadRequest)),
            ProfileUpdateResultType.Updated when result.Profile is not null => Ok(result.Profile),
            _ => Problem(
                title: "Profile update failed",
                detail: "The profile could not be updated.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }
}
