using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace HomeThings.Server.Controllers
{
    public abstract class ApiControllerWithHub<TEntity, THub> : ApiController
        where TEntity:Entity
        where THub : IHub
    {
       
        Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );

        Lazy<IUnitOfWork> uow = new Lazy<IUnitOfWork>(
            () => new UnitOfWork()
        );

        protected IHubContext Hub=> hub.Value;

        protected IUnitOfWork UnitOfWork => uow.Value;

        public abstract IRepository<TEntity> Repository { get; }

        protected virtual void AfterInsert(TEntity entity) { }

        protected virtual void AfterDelete(int id) { }

        public virtual IHttpActionResult Post(TEntity entity)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    Repository.Insert(entity);
                    UnitOfWork.Save();
                    AfterInsert(entity);
                }
                return Ok(entity);
            }
            catch (DataException ex)
            {
                ModelState.AddModelError("", ex);

            }
            return this.Conflict();
        }

        public virtual IHttpActionResult Put(int id,TEntity entity)
        {
            var existingProduct = Repository.GetByID(id);

            if (existingProduct == null)
                return this.NotFound();

            Repository.Update(entity);
            UnitOfWork.Save();
            return Ok(entity);

        }

        public virtual IHttpActionResult Delete(int id)
        {
            Repository.Delete(id);
            UnitOfWork.Save();
            AfterDelete(id);
            return Ok();
        }

        public IQueryable<Entity> Get()
        {

            return Repository.Get();
        }

        public IHttpActionResult Get(int id)
        {
            var entity = Repository.GetByID(id);

            if (entity == null)
                this.NotFound();

            return Ok(entity);
        }

    }
}
