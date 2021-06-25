import { Campaign } from '@/types';
import { formatDate } from '@/util';
import { Button } from '@material-ui/core';
import { parse } from 'json2csv';

export type CsvButtonProps = {
  className?: string;
  campaign: Campaign;
};

const CsvButton: React.FC<CsvButtonProps> = ({
  className,
  campaign: { name, submittedTweets, users },
}) => {
  if (!submittedTweets || !users) {
    return null;
  }

  const fields: string[] = [];

  let data: any;

  /* if (users.length > 1) {
    fields.push('Influencer');
    let maxTweetsByUser = 0;
    data = [...users]
      .sort(({ screenName: a }, { screenName: b }) => a!.localeCompare(b!))
      .reduce<Record<string, string>[]>((acc, user) => {
        const tweets = submittedTweets.filter(
          ({ authorId }) => authorId === user.id
        );

        maxTweetsByUser = Math.max(maxTweetsByUser, tweets.length);

        const influencer = `twitter.com/${user.screenName}`;
        const row = tweets.reduce<Record<string, string>>(
          (rowAcc, { id }, index) => {
            rowAcc[`Tweet ${index + 1}`] = `${influencer}/status/${id}`;
            return rowAcc;
          },
          {}
        );
        row.Influencer = influencer;

        acc.push(row);

        return acc;
      }, []);
    for (let i = 0; i < maxTweetsByUser; i++) {
      fields.push(`Tweet ${i + 1}`);
    }
  } else if (users.length === 1) { */
  fields.push('Influencer', 'Date', 'Tweet');
  data = submittedTweets
    .sort(({ createdAt: a }, { createdAt: b }) => a.valueOf() - b.valueOf())
    .reduce<Record<string, string>[]>((acc, { id, createdAt, authorId }) => {
      const user = users.find(({ id }) => id === authorId)!;
      if (!user) return acc;
      const influencer = `twitter.com/${user.screenName}`;
      acc.push({
        Influencer: influencer,
        Tweet: `${influencer}/status/${id}`,
        Date: formatDate(createdAt),
      });
      return acc;
    }, []);
  /* } */

  if (!data || !data.length) return null;
  const csv = parse(data, { fields });

  const blob = new Blob(['\ufeff', csv]);
  const url = URL.createObjectURL(blob);

  return (
    <Button
      className={className}
      variant="contained"
      size="small"
      href={url}
      download={`${name}.csv`}
    >
      Download CSV
    </Button>
  );
};

export default CsvButton;
