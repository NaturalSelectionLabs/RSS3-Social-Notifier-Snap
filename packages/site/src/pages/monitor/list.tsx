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

const MonitorList = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.snapsDetected;

  const [monitorList, setMonitorList] = useState<SocialMonitor[]>([]);
  const handleGetState = async () => {
    const snapState = await sendGetState();
    console.log(snapState.monitor);
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
                <div className="flex w-full justify-end">
                  <Badge
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => {
                      console.log(monitor.lastUpdatedActivities?.length ?? 0);
                    }}
                  >
                    {monitor.lastUpdatedActivities?.length ?? 0}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold">{monitor.search}</h3>
                <p>
                  Last Updated:{' '}
                  <span className="text-base text-muted-foreground">
                    {monitor.latestUpdateTime ?? 'not started yet'}
                  </span>
                </p>
                <div className="flex flex-wrap items-center justify-start gap-3">
                  {monitor.profiles.map((item) => (
                    <Card
                      key={item.handle}
                      onClick={() => {
                        console.log(item);
                      }}
                      className={cn('relative w-[360px] cursor-pointer')}
                    >
                      <CardContent className="my-3 space-y-2">
                        <div className="flex justify-end">
                          <Badge>{item.platform}</Badge>
                        </div>
                        <div className="flex flex-row items-center gap-3">
                          <Avatar>
                            <AvatarImage src={item.profileURI?.[0]} />
                            <AvatarFallback>
                              {item.handle?.slice(0, 2).toLocaleUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="text-sm text-muted-foreground">
                            {item.handle}
                          </h3>
                        </div>
                        <p className="text-sm line-clamp-1 min-h-[20px]">
                          {item.bio}{' '}
                        </p>
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
