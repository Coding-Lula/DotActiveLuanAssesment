namespace LuanAssesment.Entities
{
    public class Role
    {
        public int pkRoleId { get; set; }
        public string sRoleName { get; set; } = string.Empty;
        public string? sProvince { get; set; }
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
