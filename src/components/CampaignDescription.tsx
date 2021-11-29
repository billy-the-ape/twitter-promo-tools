import { makeStyles } from '@material-ui/core';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

const useStyles = makeStyles(({ spacing }) => ({
  markDown: {
    margin: 0,
    lineHeight: spacing(2) + 'px',
  },
}));

export type CampaignDescriptionProps = {
  description: string;
};

const CampaignDescription: React.FC<CampaignDescriptionProps> = ({
  description,
}) => {
  const classes = useStyles();

  return (
    <div>
      {description.split('\n').map((desc, i) => (
        <ReactMarkdown
          remarkPlugins={[gfm]}
          className={classes.markDown}
          key={i}
          linkTarget="_blank"
        >
          {desc}
        </ReactMarkdown>
      ))}
    </div>
  );
};

export default CampaignDescription;
