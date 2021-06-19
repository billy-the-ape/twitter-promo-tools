import { Campaign } from '@/types';
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

  const fields = ['Influencer'];
  let maxTweetsByUser = 0;

  const data = [...users]
    .sort(({ screenName: a }, { screenName: b }) => a!.localeCompare(b!))
    .reduce<Record<string, string>[]>((acc, user) => {
      const tweets = submittedTweets.filter(
        ({ authorId }) => authorId === user.id
      );

      if (tweets.length > 0) {
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
      }

      return acc;
    }, []);

  for (let i = 0; i < maxTweetsByUser; i++) {
    fields.push(`Tweet ${i + 1}`);
  }

  if (!data) return null;
  const csv = parse(data, { fields });

  var blob = new Blob(['\ufeff', csv]);
  var url = URL.createObjectURL(blob);

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
