using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public class UnitOfWork : IUnitOfWork
    {

        private ThingsContext context = new ThingsContext();
        private IRepository<Thing> thingRepository;
        private IRepository<Setting> settingRepository;
        private IRepository<Input> intputRepository;
        public IRepository<Thing> ThingRepository
        {
            get
            {

                if (this.thingRepository == null)
                {
                    this.thingRepository = new GenericRepository<Thing>(context);
                }
                return thingRepository;
            }
        }

        public IRepository<Setting> SettingRepository
        {
            get
            {

                if (this.settingRepository == null)
                {
                    this.settingRepository = new GenericRepository<Setting>(context);
                }
                return settingRepository;
            }
        }

        public IRepository<Input> InputRepository
        {
            get
            {

                if (this.intputRepository == null)
                {
                    this.intputRepository = new GenericRepository<Input>(context);
                }
                return intputRepository;
            }
        }

        public void Save()
        {
            context.SaveChanges();
        }



        #region Dispose
        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed)
            {
                if (disposing)
                {
                    context.Dispose();
                }
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        #endregion
    }

    public interface IUnitOfWork:IDisposable
    {
        void Save();
        IRepository<Thing> ThingRepository { get; }
        IRepository<Setting> SettingRepository { get; }
        IRepository<Input> InputRepository { get;  }
    }
}
