using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public class Thing:Entity
    {

        public Status Status { get; set; }
    }

    public enum Status
    {
        Autonome,
        Connecte
    }
}
