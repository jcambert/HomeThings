using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public class BlocklyToolbox : Entity
    {
        public List<Block> Blocks { get; set; } = new List<Block>();

        public List<BlockCategory> Categories { get; set; } = new List<BlockCategory>();

       
    }

    public class BlockCategory
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Colour { get; set; }
        public string Custom { get; set; }
    }

    public class Block
    {
        [Key]
        public int Id { get; set; }
        public string Type { get; set; }
    }
}
