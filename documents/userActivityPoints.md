# User Acitivity Points

## Abstract

This document describes the user activity points system. The user activity points system is a system that rewards users for their activity in the Discord server. The system is designed to encourage users to be active in the server and to reward them for their activity.

## Table of Actions

| Status | Action                                                                                     | Points | Partials? |
| ------ | ------------------------------------------------------------------------------------------ | ------ | --------- |
| DONE   | Member sends a message to a guild channel                                                  | +1     | Yes       |
| DONE   | Member's message is deleted from a guild channel                                           | -1     | No        |
| DONE   | Member sends any reaction(s) to a message from another member in a guild channel           | +0.1   | Yes       |
| DONE   | Member removes all of their own reactions from another member's message in a guild channel | -0.1   | Yes       |
| DONE   | Member's message receives any reaction(s) from another member                              | +0.5   | Yes       |
| DONE   | Member's message loses all of its reactions from another member                            | -0.5   | Yes       |
