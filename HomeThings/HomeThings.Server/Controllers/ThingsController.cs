using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace HomeThings.Server.Controllers
{

    public class ThingsController:ApiControllerWithHub<HomeThingsHub>
    {
        
        public ThingsController()
        {
        }

        public IRepository<Thing> Repository => UnitOfWork.ThingRepository;

        public IHttpActionResult PostThings(Thing thing)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    Repository.Insert(thing);
                    UnitOfWork.Save();
                    Hub.Clients.All.Add(thing);
                }
                return Ok(thing);
            }
            catch (DataException ex)
            {
                ModelState.AddModelError("", ex);
              
            }
            return this.Conflict();
        }

        public IHttpActionResult Delete(int id)
        {
            Repository.Delete(id);
            UnitOfWork.Save();
            Hub.Clients.All.RemoveThing(id);
            return Ok();
        }

        public IQueryable<Thing> Get()
        {
/*#if DEBUG
            if (Repository.Count() == 0)
            {
                Repository.Insert(new Thing() { Id = 1, Status = Status.Autonome });
                UnitOfWork.Save();
            }
#endif*/
                return UnitOfWork.ThingRepository.Get();
        }

      /*  public IHttpActionResult PostDetecter()
        {

        }

        public IHttpActionResult PostConnecter()
        {

        }

        public IHttpActionResult PostDeconnecter()
        {

        }

        public IHttpActionResult PostActionner()
        {

        }

        public IHttpActionResult PostLireEtat()
        {

        }

        public IHttpActionResult PostChangeEtat()
        {

        }*/
    }
}
