import { useState, useEffect, useMemo, useContext } from 'react';
import * as z from 'zod';
import { formatAddressAndNS } from '@rss3/api-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate } from 'gatsby';
import { Profile } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  addProfilesToMonitorFollowing,
  getProfilesFilterBySearch,
  isLocalSnap,
  showAllSocialPlatforms,
} from '@/utils';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { MetaMaskContext, MetamaskActions } from '@/hooks';
import { defaultSnapOrigin } from '@/config';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  platforms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one platform.',
  }),

  search: z
    .string()
    .min(1, { message: 'You have to enter at least one keyword.' }),
});

const MonitorCreate = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.snapsDetected;

  const [socialPlatforms, setSocialPlatforms] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectProfilesHandle, setSelectedProfileHandle] = useState<string[]>(
    [],
  );
  const [searchValue, setSearchValue] = useState<string>('');
  const platforms = useMemo(() => {
    if (socialPlatforms.length === 0) {
      return [];
    }

    return socialPlatforms.map((item) => ({
      id: item,
      label: item,
    }));
  }, [socialPlatforms]);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      platforms: [],
      search: '',
    },
  });
  useEffect(() => {
    showAllSocialPlatforms().then((res) =>
      setSocialPlatforms(res as unknown as string[]),
    );
  }, []);

  if (socialPlatforms.length === 0 || !isMetaMaskReady) {
    return <div>loading...</div>;
  }

  const onSubmit = async function (data: z.infer<typeof FormSchema>) {
    const { search, platforms: selectedPlatforms } = data;
    try {
      const resp = (await getProfilesFilterBySearch(
        search,
        selectedPlatforms,
      )) as Profile[];
      setSearchValue(search);
      setProfiles(resp);
    } catch (e) {
      // console.error('error');
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const addProfilesToMonitorFollowingHandler = async () => {
    if (selectProfilesHandle.length === 0) {
      return;
    }

    try {
      const selectedProfiles = profiles.filter(
        (item) => item.handle && selectProfilesHandle.includes(item.handle),
      );
      // console.log(searchValue);
      // console.log(selectedProfiles);
      const isSuccess = await addProfilesToMonitorFollowing(
        searchValue,
        selectedProfiles,
      );

      if (isSuccess) {
        navigate('/monitor/list');
        // const snapState = await sendGetState();
        // console.log(snapState);
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <div className="container flex-1">
      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="search"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Stalk</FormLabel>
                  <FormDescription>
                    <p>
                      Feeling stalk-y? Get notified for someone else's frens
                      publish something on Web3 social platforms.
                    </p>
                    <p>Supported Web3 Name Service:</p>
                    <b>
                      .eth, .lens, .csb, .bnb, .bit, .crypto, .zil, .nft, .x,
                      .wallet, .bitcoin, .dao, .888, .blockchain, .avax, .arb,
                      .cyber
                    </b>
                    <p>
                      And of course, your favorite and easy-to-memorize 0x
                      address.
                    </p>
                  </FormDescription>
                </div>
                <FormField
                  control={form.control}
                  name="search"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 leading-8 space-y-0">
                      <FormControl>
                        <Input placeholder="Web3 DID" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platforms"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Platforms</FormLabel>
                  <FormDescription>
                    Select the platforms you want to get notified.
                  </FormDescription>
                </div>
                <div className="flex flex-row items-center justify-start gap-3">
                  {platforms.map((item) => (
                    <FormField
                      control={form.control}
                      name="platforms"
                      key={item.id}
                      render={({ field }) => (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-center space-x-2 leading-8 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Begin Stalking</Button>
        </form>
      </Form>
      {profiles.length > 0 && (
        <div className="flex flex-col items-start justify-center gap-3 mt-10">
          <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base">
            Select the Profile(s)
          </h3>
          <div className="flex flex-wrap items-start justify-start gap-3">
            {profiles.map((item) => (
              <Card
                key={item.handle}
                onClick={() => {
                  setSelectedProfileHandle((prev) => {
                    if (item.handle) {
                      if (prev.includes(item.handle)) {
                        return prev.filter((value) => value !== item.handle);
                      }
                      return [...prev, item.handle];
                    }
                    return prev;
                  });
                }}
                className={cn(
                  'relative w-[360px] cursor-pointer',
                  item.handle &&
                    selectProfilesHandle.includes(item.handle) &&
                    'border-2 border-primary',
                )}
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
                      {item.handle && formatAddressAndNS(item.handle)}
                    </h3>
                  </div>
                  <p className="text-sm line-clamp-1 min-h-[20px]">
                    {item.bio}{' '}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={addProfilesToMonitorFollowingHandler}>
            Get Notfied!
          </Button>
        </div>
      )}
    </div>
  );
};

export default MonitorCreate;
