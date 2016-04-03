using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace HomeThings.Server.Controllers
{

    public class ThingsController : ApiControllerWithHub<Thing, HomeThingsHub>
    {

        public ThingsController()
        {
        
        }

        public override IRepository<Thing> Repository => UnitOfWork.ThingRepository;

        //public IRepository<Thing> Repository => UnitOfWork.ThingRepository;


        protected override void AfterInsert(Thing entity)
        {
            base.AfterInsert(entity);
            Hub.Clients.All.AddThing();
        }

        protected override void AfterDelete(int id)
        {
            base.AfterDelete(id);
            Hub.Clients.All.RemoveThing(id);
        }
        /*public IHttpActionResult PostThings(Thing thing)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    Repository.Insert(thing);
                    UnitOfWork.Save();
                    Hub.Clients.All.AddThing();
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
            Hub.Clients.All.RemoveThing("");
            return Ok();
        }

        public IQueryable<Thing> Get()
        {
            
            return UnitOfWork.ThingRepository.Get();
        }*/

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
