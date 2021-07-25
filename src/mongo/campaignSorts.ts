export const sortMap = {
  urgency: {
    $sort: {
      hidden: 1,
      completionOffBy: -1,
    },
  },
  name: {
    $sort: {
      name: 1,
    },
  },
  dateAddedAsc: {
    $sort: {
      dateAdded: 1,
    },
  },
  dateAddedDesc: {
    $sort: {
      dateAdded: -1,
    },
  },
  endDate: {
    $sort: {
      endDate: 1,
      dateAdded: 1,
    },
  },
};

export type ValidSort = keyof typeof sortMap;
