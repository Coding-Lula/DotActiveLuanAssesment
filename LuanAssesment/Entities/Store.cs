namespace LuanAssesment.Entities
{
    public class Store
    {
        public int pkStoreId { get; set; }
        public string sStoreCode { get; set; } = string.Empty;
        public string sStoreName { get; set; } = string.Empty;
        public string sDivision { get; set; } = string.Empty;
        public string sProvince { get; set; } = string.Empty;
        public int iOverduePlanograms { get; set; }
    }
}
