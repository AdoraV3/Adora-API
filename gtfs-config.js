export default {
  sqlitePath: './gtfs.sqlite',
  agencies: [
    {
      agency_key: 'adora_go',
      path: './gtfs-data/go.zip'
    },
    {
      agency_key: 'adora_up',
      path: './gtfs-data/up.zip'
    }
  ],
  includeAgencyId: true,
  useAgencyIdField: true,
  ignoreDuplicates: true
};
