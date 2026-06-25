using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Groups;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Справочник академических (учебных) групп.
/// Базовый маршрут: <c>api/groups</c>. Просмотр — JWT; создание — роль Admin.
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
    /// GET <c>api/groups</c> — возвращает список всех учебных групп.
    /// Требуется JWT. 200 со справочником групп для заполнения профиля.
    /// </summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<GroupResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<GroupResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _groupsService.GetAllAsync(cancellationToken));
    }

    /// <summary>
    /// POST <c>api/groups</c> — создаёт новую учебную группу.
    /// Требуется JWT и роль Admin. 201 Created с данными группы; 403 без прав администратора.
    /// </summary>
    /// <param name="request">Код и название учебной группы.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
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
