import { useContext, useEffect, useState } from 'react';
import {
  type SocialMonitor,
  getProfilesToMonitorFollowing,
  isLocalSnap,
  sendGetState,
} from '@/utils';
import { MetaMaskContext, MetamaskActions } from '@/hooks';
import { defaultSnapOrigin } from '@/config';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
// import { toast } from '@/components/ui/use-toast';

const replaceIpfs = (link: string) => {
  if (link.startsWith('ipfs://')) {
    return link.replace('ipfs://', 'https://ipfs.xlog.app/ipfs/');
  }
  return link;
};

const MonitorList = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.snapsDetected;

  const [monitorList, setMonitorList] = useState<SocialMonitor[]>([]);
  const handleGetState = async () => {
    const snapState = await sendGetState();
    console.log(snapState);
    // toast({
    //   title: 'You submitted the following values:',
    //   description: (
    //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">
    //         {JSON.stringify(snapState.monitor, null, 2)}
    //       </code>
    //     </pre>
    //   ),
    // });
  };

  useEffect(() => {
    if (isMetaMaskReady) {
      getProfilesToMonitorFollowing()
        .then((list: SocialMonitor[]) => {
          setMonitorList(list);
        })
        .catch((e) => {
          dispatch({ type: MetamaskActions.SetError, payload: e });
        });
    }
  }, [isMetaMaskReady]);

  if (!isMetaMaskReady) {
    return <div>loading..</div>;
  }

  return (
    <div className="container flex-1">
      <Button onClick={handleGetState}>GetState</Button>
      {monitorList.length > 0 && (
        <div className="flex flex-col items-start justify-center gap-5 my-4">
          {monitorList.map((monitor) => {
            return (
              <div
                key={monitor.search}
                className="flex flex-col items-start justify-center gap-4 border border-solid border-gray-100 w-full p-6 rounded-lg"
              >
                <h3 className="text-lg font-bold">
                  Monitor {monitor.search}'s following
                </h3>
                <p>
                  Last Updated:{' '}
                  <span className="text-base text-muted-foreground">
                    {monitor.latestUpdateTime ?? 'not started yet'}
                  </span>
                </p>
                <div className="flex flex-wrap items-center justify-start gap-3">
                  {monitor.following?.map((fol) => (
                    <Card
                      key={fol.owner.handle}
                      onClick={() => {
                        console.log(fol);
                      }}
                      className={cn('relative w-[360px] cursor-pointer')}
                    >
                      <CardContent className="my-3 space-y-2">
                        <div className="flex justify-between">
                          <Badge>{fol.platform}</Badge>
                          {/* <Badge></Badge> */}
                        </div>
                        <div className="flex flex-row items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={replaceIpfs(fol.owner.avatar ?? '')}
                            />
                            <AvatarFallback>
                              {fol.owner.handle.slice(0, 2).toLocaleUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="text-sm text-muted-foreground">
                            {fol.owner.handle}
                          </h3>
                        </div>
                        <p>Following: {fol.following?.length ?? 0}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonitorList;
