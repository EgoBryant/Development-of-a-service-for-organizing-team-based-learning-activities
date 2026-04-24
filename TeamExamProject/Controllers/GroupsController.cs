using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Groups;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Методы работы с академическими группами.
/// </summary>
[Route("api/groups")]
[Authorize]
public class GroupsController : ApiControllerBase
{
    private readonly IGroupsService _groupsService;

    public GroupsController(IGroupsService groupsService)
    {
        _groupsService = groupsService;
    }

    /// <summary>
    /// Возвращает список всех учебных групп.
    /// </summary>
    /// <returns>Справочник групп для заполнения профиля пользователя.</returns>
    [HttpGet]
    [ProducesResponseType<IEnumerable<GroupResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<GroupResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _groupsService.GetAllAsync(cancellationToken));
    }

    /// <summary>
    /// Создает новую учебную группу. Доступно только администратору.
    /// </summary>
    /// <param name="request">Код и название учебной группы.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Созданная учебная группа.</returns>
    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType<GroupResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<GroupResponse>> Create(CreateGroupDto request, CancellationToken cancellationToken)
    {
        var group = await _groupsService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = group.Id }, group);
    }
}
