import _ from 'lodash';
import * as lf from 'lovefield';

let initedFlg = false;
let schemaBuilder = null;
let db = null;
let table = null;

const sequencerDb = {
  init() {
    return new Promise((resolve) => {
      if (!initedFlg) {
        schemaBuilder = lf.schema.create('sequencer', 1);
        schemaBuilder.createTable('sequenceDatas')
          .addColumn('id', lf.Type.INTEGER)
          .addColumn('title', lf.Type.STRING)
          .addColumn('tracks', lf.Type.OBJECT)
          .addColumn('bpm', lf.Type.INTEGER)
          .addColumn('swing', lf.Type.INTEGER)
          .addColumn('sustain', lf.Type.INTEGER)
          .addColumn('createdAt', lf.Type.DATE_TIME)
          .addPrimaryKey(['id'], true, lf.Order.DESC);
        schemaBuilder.connect().then((connectedDb) => {
          db = connectedDb;
          table = connectedDb.getSchema().table('sequenceDatas');
          initedFlg = true;
          resolve(this);
        });
      }
    });
  },

  isInited() {
    return initedFlg && !_.isNull(db) && !_.isNull(table);
  },

  insert({ title, tracks, bpm, swing, sustain }) {
    return new Promise((resolve) => {
      if (this.isInited()) {
        const row = table.createRow(
          {
            title,
            tracks,
            bpm,
            swing,
            sustain,
            createdAt: new Date(),
          },
        );
        resolve(db.insert().into(table).values([row]).exec());
      } else {
        this.init().then((result) => {
          result.insert({ title, tracks, bpm, swing, sustain });
        });
      }
    });
  },

  deleteById(id) {
    return new Promise((resolve) => {
      if (this.isInited()) {
        db
          .delete()
          .from(table)
          .where(table.id.eq(id))
          .exec()
          .then((result) => {
            resolve(result);
          });
      } else {
        this.init().then((result) => {
          result.deleteById(id);
        });
      }
    });
  },

  selectAll() {
    return new Promise((resolve) => {
      if (this.isInited()) {
        resolve(db
          .select()
          .from(table)
          .limit(100)
          .orderBy(table.id, lf.Order.DESC)
          .exec());
      } else {
        this.init().then((result) => {
          result.selectAll();
        });
      }
    });
  },

};

export default sequencerDb;

