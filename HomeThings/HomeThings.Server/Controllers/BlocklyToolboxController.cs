using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace HomeThings.Server.Controllers
{
  
    public class BlocklyToolboxController : ApiControllerWithHub<BlocklyToolbox, BlocklyHub>
    {
        public override IRepository<BlocklyToolbox> Repository => UnitOfWork.BlocklyToolboxRepository;

       [ActionName("DefaultToolbox")]
        public HttpResponseMessage GetDefaultToolbox()
        {
            var toolbox = new BlocklyToolbox() { Id = 0 };
            toolbox.Blocks.Add(new Block() { Type = "controls_if" });
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, toolbox);
            // return Ok(toolbox);
            return response;
        }
        
    }
}
