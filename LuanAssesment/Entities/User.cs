namespace LuanAssesment.Entities
{
    public class User
    {
        public int pkUserId { get; set; }
        public string sUsername { get; set; } = string.Empty;
        public string sPassword { get; set; } = string.Empty;
        public int fkRoleId { get; set; }
        public Role Role { get; set; } = null!;
    }
}
