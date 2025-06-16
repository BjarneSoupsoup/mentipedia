package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/akamensky/argparse"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/gmail/v1"
)

func main() {
	argparser := argparse.NewParser("gmail-oauth-token-fetcher", "A small tool that authenticates against gmail api auth servers using oauth and returns the token")
	jsonCredentialsFilepathPtr := argparser.String("j", "jsonCredentialsFilepath", &argparse.Options{Required: true})
	err := argparser.Parse(os.Args)
	if err != nil {
		fmt.Print(argparser.Usage(err))
		return
	}

	oauthConfigFileBytes, _ := os.ReadFile(*jsonCredentialsFilepathPtr)
	oauthConfig, _ := google.ConfigFromJSON(oauthConfigFileBytes, gmail.GmailSendScope, gmail.GmailComposeScope)

	fmt.Printf("Go to: %s\n", oauthConfig.AuthCodeURL("oauth-token", oauth2.AccessTypeOffline))
	fmt.Println("Log in. You will be redirected to a page that doesn't exist. It doesn't matter. Just look for the query string param named 'code' and copy the code into the console")
	var authCode string
	fmt.Scan(&authCode)
	fmt.Println("")
	token, err := oauthConfig.Exchange(context.TODO(), authCode, oauth2.AccessTypeOffline)
	if err != nil {
		fmt.Printf("Could not authenticate: %+v", err)
		return
	}
	tokenJsonByteArr, _ := json.Marshal(token)
	fmt.Printf("Auth was OK. Got token: %s \n", string(tokenJsonByteArr))
}
