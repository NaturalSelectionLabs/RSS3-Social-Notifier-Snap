import { useState, useEffect, useMemo } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { getAllFollowing, showAllSocialPlatforms } from '@/utils';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
// import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const FormSchema = z.object({
  platforms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one platform.',
  }),

  search: z
    .string()
    .min(1, { message: 'You have to enter at least one keyword.' }),
});

const Monitor = () => {
  const [socialPlatforms, setSocialPlatforms] = useState<string[]>([]);
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

  if (socialPlatforms.length === 0) {
    return <div>loading...</div>;
  }

  const onSubmit = async function (data: z.infer<typeof FormSchema>) {
    const { search, platforms: selectedPlatforms } = data;
    console.log(search, selectedPlatforms);
    const resp = await getAllFollowing(search, selectedPlatforms);
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(resp, null, 2)}</code>
        </pre>
      ),
    });
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
                  <FormLabel className="text-base">Search Key</FormLabel>
                  <FormDescription>
                    <p>
                      Start monitoring a new address. Supported Web3 Name
                      Service:
                    </p>
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
                        <Input placeholder="Wallet Address" {...field} />
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
                    Select the platforms you want to monitor in the snap.
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

          <Button type="submit">query</Button>
        </form>
      </Form>
      {/* {socialPlatforms.join(',')} */}
    </div>
  );
};

export default Monitor;
