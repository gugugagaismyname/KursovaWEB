namespace SimpleTODOLesson.Server.Models
{
    public class Bonus
    {
        public int Id { get; set; }

        public string Title { get; set; } = "";
        public string Url { get; set; } = "";
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
