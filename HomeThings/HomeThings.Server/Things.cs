using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public class Things
    {
        public int Id { get; set; }

        public Status Status { get; set; }
    }

    public enum Status
    {
        Autonome,
        Connecte
    }
}
