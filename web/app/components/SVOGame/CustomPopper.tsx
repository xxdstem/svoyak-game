import { Box, Popper, Typography, useTheme } from "@mui/material"

type Props = {
  text?: string;
  anchorEl: HTMLElement | null;
  placement?: "right" | "top";
}

export const CustomPopper : React.FC<Props> = (props) => {
  const {text, anchorEl, placement = "right"} = props;
  const theme = useTheme();

  // Стили стрелки для right
  const arrowRightSx = {
    position: 'absolute',
    top: '50%',
    left: -12,
    transform: 'translateY(-50%)',
    width: 0,
    height: 0,
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
    borderRight: `12px solid ${theme.palette.background.paper}`,
    zIndex: 2,
    boxShadow: 1,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-8px',
      left: '-2px',
      width: 0,
      height: 0,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderRight: `14px solid ${theme.palette.primary.main}`,
      zIndex: 1,
    }
  };

  // Стили стрелки для top (стрелка снизу)
  const arrowTopSx = {
    position: 'absolute',
    left: '50%',
    bottom: -12,
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `12px solid ${theme.palette.background.paper}`,
    zIndex: 2,
    boxShadow: 1,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '-8px',
      bottom: '-2px',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: `14px solid ${theme.palette.primary.main}`,
      zIndex: 1,
    }
  };

  const arrowSx = placement === "right" ? arrowRightSx : arrowTopSx;

  return (
    <Popper
      open={Boolean(text)}
      anchorEl={anchorEl}
      placement={placement}
      sx={{ zIndex: 10 }}
      modifiers={[{ name: 'arrow', enabled: true, options: { element: '[data-popper-arrow]' } }]}
    >
      <Box sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 3,
        marginLeft: placement === 'right' ? 1 : 0,
        marginBottom: placement === 'top' ? '12px' : 0,
        borderRadius: 2,
        px: 2,
        py: 1.5,
        border: '2px solid',
        borderColor: 'primary.main',
        maxWidth: 200,
        opacity: 0.9
      }}>
        <Typography variant="subtitle2">{text}</Typography>
        <Box data-popper-arrow sx={arrowSx} />
      </Box>
    </Popper>
  );
}