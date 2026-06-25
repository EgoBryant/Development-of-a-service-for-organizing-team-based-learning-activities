using TeamExamProject.Models;

namespace TeamExamProject.Services;

public static class ProfileCompletion
{
    public static bool IsComplete(User user)
    {
        if (string.IsNullOrWhiteSpace(user.FirstName) || string.IsNullOrWhiteSpace(user.LastName))
        {
            return false;
        }

        if (user.GroupId is not null)
        {
            return true;
        }

        return !string.IsNullOrWhiteSpace(user.AcademicGroupLabel);
    }
}
