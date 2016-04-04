using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public class Input:Entity
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Description{ get; set; }

        
    }

    public class Output : Entity
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Description { get; set; }

    }
}
