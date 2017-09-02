import _ from 'lodash';
import * as lf from 'lovefield';

let initedFlg = false;
let lock = false;
let schemaBuilder = null;
let db = null;
let table = null;

const sequencerDb = {
  init() {
    return new Promise((resolve) => {
      if (!initedFlg && !lock) {
        lock = true;
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
          lock = false;
          resolve(this);
        });
      }
    });
  },
  isInited() {
    return initedFlg && !_.isNull(db) && !_.isNull(table);
  },

  insert({ title, tracks, bpm, swing, sustain }) {
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
      db.insert().into(table).values([row]).exec();
    } else {
      this.init().then((result) => {
        result.insert({ title, tracks, bpm, swing, sustain });
      });
    }
  },

  selectAll() {
    if (this.isInited()) {
      return new Promise((resolve) => {
        resolve(db
          .select()
          .from(table)
          .limit(20)
          .orderBy(table.id, lf.Order.DESC)
          .exec());
      });
    }
    return this.init().then((result) => {
      result.selectAll();
    });
  },

};

export default sequencerDb;

