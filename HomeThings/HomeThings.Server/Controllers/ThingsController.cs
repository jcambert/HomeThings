using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace HomeThings.Server.Controllers
{

    public class ThingsController : ApiControllerWithHub<HomeThingsHub>
    {

        public ThingsController()
        {
         /*   ((HomeThingsHub)Hub).OnConnected().ContinueWith((a) =>
            {
                if (Repository.Count() == 0)
                {
                    
                    

                    for (int i = 1; i < 11; i++)
                    {
                        Repository.Insert(new Thing() { Id = i, Status = Status.Autonome });
                    }
                }
                UnitOfWork.Save();
            });*/
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
