namespace SimpleTODOLesson.Server.Models
{
    public class Comment
    {
        public int Id { get; set; }

        public string Content { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public int ArticleId { get; set; }
        public Article Article { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

    }
}
