using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public class Setting:Entity
    {
        [Required]
        public int AutomaticRefreshTime { get; set; }

        [Required]
        public bool ManualRefreshMode{ get; set; }
    }
}
