
'use client';

import type { FormEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, Send, Loader2, X } from 'lucide-react';
import type { SupportChatInput, SupportChatOutput, ChatMessage } from '@/ai/flows/support-chat-flow';
import { handleSupportChat } from '@/ai/flows/support-chat-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: 'Hello! How can I assist you with LinguaLeap today?' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const userMessageContent = inputValue.trim();
        if (!userMessageContent || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userMessageContent };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            const input: SupportChatInput = { history: updatedMessages };
            const result: SupportChatOutput = await handleSupportChat(input);

            if (result.response) {
                const botMessage: ChatMessage = { role: 'model', content: result.response };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } else {
                // Handle cases where the flow might return an empty response (though the flow tries to prevent this)
                toast({
                    title: 'Chat Error',
                    description: 'Received an empty response from the assistant.',
                    variant: 'destructive',
                });
                 // Add a fallback message to the chat history
                 const errorBotMessage: ChatMessage = { role: 'model', content: "Sorry, I couldn't generate a response. Please try again." };
                 setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
            }
        } catch (error) {
            console.error('Error calling chat flow:', error);
            toast({
                title: 'Chat Error',
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
                variant: 'destructive',
            });
             // Add a fallback message to the chat history
            const errorBotMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try asking again later." };
            setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-80 h-[28rem] flex flex-col shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                    <CardTitle className="text-lg">Support Chat</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close chat</span>
                    </Button>
                </CardHeader>
                <CardContent className="flex-grow p-0 overflow-hidden">
                    <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'flex items-start gap-3',
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    {message.role === 'model' && (
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={cn(
                                            'max-w-[75%] rounded-lg p-2 text-sm',
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3 justify-start">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-lg p-2 text-sm">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Type your message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">Send message</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}

