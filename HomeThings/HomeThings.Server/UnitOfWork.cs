using HomeThings.Server.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public class UnitOfWork : IUnitOfWork
    {

        private readonly Lazy<ThingsContext> context ;
        private readonly Lazy<IRepository<Thing>> thingRepository;
        private readonly Lazy<IRepository<Command>> commandRepository;
        private readonly Lazy<IRepository<Setting>> settingRepository;
        private readonly Lazy<IRepository<Input>> inputRepository ;
        private readonly Lazy<IRepository<BlocklyToolbox>> blocklyToolboxRepository ;

        public UnitOfWork()
        {
            context = new Lazy<Server.ThingsContext>(() => new ThingsContext());
            thingRepository = createLazyRepository<Thing>();
            commandRepository = createLazyRepository<Command>();
            settingRepository = createLazyRepository<Setting>();
            inputRepository = createLazyRepository<Input>();
            blocklyToolboxRepository = createLazyRepository<BlocklyToolbox>();
        }

        public ThingsContext Context => context.Value;

        public IRepository<Thing> ThingRepository => thingRepository.Value;

        public IRepository<Command> CommandRepository => commandRepository.Value;

        public IRepository<Setting> SettingRepository => settingRepository.Value;

        public IRepository<Input> InputRepository => inputRepository.Value;

        public IRepository<BlocklyToolbox> BlocklyToolboxRepository => blocklyToolboxRepository.Value;

       

        private  Lazy<IRepository<T>> createLazyRepository<T>() where T : Entity => new Lazy<IRepository<T>>(() => new GenericRepository<T>(Context));
        

        public void Save()
        {
            Context.SaveChanges();
        }



        #region Dispose
        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed)
            {
                if (disposing)
                {
                    if(context.IsValueCreated)
                        context.Value.Dispose();
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

    public interface IUnitOfWork : IDisposable
    {
        void Save();
        IRepository<Thing> ThingRepository { get; }
        IRepository<Command> CommandRepository { get; }
        IRepository<Setting> SettingRepository { get; }
        IRepository<Input> InputRepository { get; }
        IRepository<BlocklyToolbox> BlocklyToolboxRepository { get;  }
    }
}
