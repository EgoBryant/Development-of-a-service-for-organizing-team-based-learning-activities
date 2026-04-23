namespace TeamExamProject.Models;

public class Group
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public string Faculty { get; set; } = string.Empty;
    public ICollection<User> Users { get; set; } = new List<User>();
}
