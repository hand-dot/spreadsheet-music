import _ from 'lodash';
import * as lf from 'lovefield';

const sequencerDb = {
  schemaBuilder: null,
  sequencerDb: null,
  datasTable: null,
  init() {
    this.schemaBuilder = lf.schema.create('sequencer', 1);
    this.schemaBuilder.createTable('sequenceDatas')
      .addColumn('id', lf.Type.INTEGER)
      .addColumn('title', lf.Type.STRING)
      .addColumn('tracks', lf.Type.OBJECT)
      .addColumn('bpm', lf.Type.INTEGER)
      .addColumn('swing', lf.Type.INTEGER)
      .addColumn('sustain', lf.Type.INTEGER)
      .addColumn('createdAt', lf.Type.DATE_TIME)
      .addPrimaryKey(['id'], true, lf.Order.DESC);
    this.schemaBuilder.connect().then((db) => {
      this.sequencerDb = db;
      this.datasTable = db.getSchema().table('sequenceDatas');
    });
  },
  insert({ title, tracks, bpm, swing, sustain }) {
    if (!_.isNull(this.sequencerDb) && !_.isNull(this.datasTable)) {
      const row = this.datasTable.createRow(
        {
          title,
          tracks,
          bpm,
          swing,
          sustain,
          createdAt: new Date(),
        },
      );
      this.sequencerDb.insert().into(this.datasTable).values([row]).exec();
    } else {
      this.init();
      this.insert({ title, tracks, bpm, swing, sustain });
    }
  },
};

export default sequencerDb;

