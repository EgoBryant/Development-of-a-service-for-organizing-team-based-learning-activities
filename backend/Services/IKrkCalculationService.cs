namespace TeamExamProject.Services;

/// <summary>
/// Считает КРК (Командный Рейтинговый Коэффициент) по формуле:
/// КРК = (БазовыйРейтинг × 0.6) + (КоэффициентСплочённости × 0.3) + (БонусЧелленджи × 0.1).
/// Подробности нормализации — см. <c>KrkCalculationService</c> и <c>FRONTEND-API-CONTRACT.md</c>.
/// </summary>
public interface IKrkCalculationService
{
    Task<double> RecalculateForTeamAsync(int teamId, CancellationToken cancellationToken = default);
    Task RecalculateAllAsync(CancellationToken cancellationToken = default);
}
