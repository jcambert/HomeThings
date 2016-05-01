using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public interface IRepository<TEntity> : IDisposable where TEntity : Entity
    {
        IQueryable<TEntity> Get(
          Expression<Func<TEntity, bool>> filter = null,
          Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null,
          string includeProperties = "");

        TEntity GetByID(object id);

        void Insert(TEntity entity);

        void Delete(object id);

        void Delete(TEntity entityToDelete);

        void DeleteAll();

        void Update(TEntity entityToUpdate);

        int Count(Expression<Func<TEntity, bool>> predicate = null);
    }
}
