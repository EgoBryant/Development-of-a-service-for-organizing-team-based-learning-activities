using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Infrastructure.Authorization;

namespace TeamExamProject.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected int? CurrentUserId => User.GetUserId();
}
