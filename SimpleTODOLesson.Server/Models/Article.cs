namespace SimpleTODOLesson.Server.Models
{
    public class Article
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public List<Comment> Comments { get; set; } = new();

    }
}