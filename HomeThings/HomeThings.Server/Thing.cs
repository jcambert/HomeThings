using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public class Thing:Entity
    {

        
        [Required]
        public string  Name { get; set; }
        [IpAddress]
        [Required]
        public string Ip { get; set; }

        public int Port { get; set; }
    }

    public enum Mode
    {
        Unknown,
        Autonome,
        Connecte
    }

    public enum State
    {
        
        Offline,
        Online
    }
   /* public class ThingState
    {
        public Status Status { get; set; }
    }*/
}
