import Button from '@mui/material/Button';
import { Link } from 'react-router';


export default function Home() {
  return <>
  <Button variant="contained" component={Link} to="/game"   disableElevation color="primary" >
            Login
          </Button>
  </>;
}
