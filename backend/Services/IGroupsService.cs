using TeamExamProject.Contracts.Groups;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис учебных групп: список групп и создание новых записей.
/// </summary>
public interface IGroupsService
{
    /// <summary>Возвращает все учебные группы.</summary>
    Task<IReadOnlyCollection<GroupResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Создаёт новую учебную группу.</summary>
    Task<GroupResponse> CreateAsync(CreateGroupDto request, CancellationToken cancellationToken = default);
}
