namespace TeamExamProject.Services;

/// <summary>
/// Считает КРК (Командный Рейтинговый Коэффициент) по формуле:
/// КРК = (БазовыйРейтинг × 0.6) + (КоэффициентСплочённости × 0.3) + (БонусЧелленджи × 0.1).
/// Подробности нормализации — см. <c>KrkCalculationService</c> и <c>FRONTEND-API-CONTRACT.md</c>.
/// </summary>
public interface IKrkCalculationService
{
    /// <summary>
    /// Пересчитывает КРК для одной команды и сохраняет результат.
    /// </summary>
    /// <param name="teamId">Идентификатор команды.</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    /// <returns>Новое значение КРК.</returns>
    Task<double> RecalculateForTeamAsync(int teamId, CancellationToken cancellationToken = default);

    /// <summary>Пересчитывает КРК для всех команд системы.</summary>
    Task RecalculateAllAsync(CancellationToken cancellationToken = default);
}
