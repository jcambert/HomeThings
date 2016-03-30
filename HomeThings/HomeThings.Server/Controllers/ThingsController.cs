using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace HomeThings.Server.Controllers
{

    public class ThingsController:ApiControllerWithHub<HomeThingsHub>
    {
        List<Things> things;

        public ThingsController()
        {
            things = new List<Things>();
            things.Add(new Things() { Id = 1, Status = Status.Connecte });
        }
        public IHttpActionResult PostThings(Things things)
        {
            Hub.Clients.All.Add(things);
            return Ok();
        }

        public IHttpActionResult Remove(Things things)
        {
            Hub.Clients.All.Remove(things);
            return Ok();
        }

        public IQueryable<Things> Get()
        {
            return things.AsQueryable();
        }
    }
}
